from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.db.models import Sum, Count, Q
from datetime import datetime, timedelta

from .models import User, Product, StockMovement
from .serializers import (
    UserSerializer, UserCreateSerializer, LoginSerializer,
    ProductSerializer, StockMovementSerializer, DashboardStatsSerializer
)
from .permissions import IsAdmin, IsAdminOrEmployee, CanModifyStock, IsOwnerOrAdmin


# ============= AUTHENTIFICATION =============

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


# ============= GESTION DES UTILISATEURS =============

class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    queryset = User.objects.all()
    serializer_class = UserSerializer


# ============= GESTION DES PRODUITS =============

class ProductListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanModifyStock]
    
    def get(self, request):
        products = Product.objects.all()
        
        search = request.query_params.get('search', None)
        category = request.query_params.get('category', None)
        low_stock = request.query_params.get('low_stock', None)
        
        if search:
            products = products.filter(
                Q(name__icontains=search) | 
                Q(reference__icontains=search) |
                Q(description__icontains=search)
            )
        
        if category:
            products = products.filter(category=category)
        
        if low_stock == 'true':
            products = [p for p in products if p.is_low_stock]
        
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductDetailView(APIView):
    permission_classes = [IsAuthenticated, CanModifyStock]
    
    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None
    
    def get(self, request, pk):
        product = self.get_object(pk)
        if product is None:
            return Response({'detail': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    
    def put(self, request, pk):
        product = self.get_object(pk)
        if product is None:
            return Response({'detail': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ProductSerializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        product = self.get_object(pk)
        if product is None:
            return Response({'detail': 'Produit non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============= MOUVEMENTS DE STOCK =============

class StockMovementListCreateView(APIView):
    permission_classes = [IsAuthenticated, CanModifyStock]
    
    def get(self, request):
        movements = StockMovement.objects.all()
        
        product_id = request.query_params.get('product', None)
        movement_type = request.query_params.get('type', None)
        
        if product_id:
            movements = movements.filter(product_id=product_id)
        
        if movement_type:
            movements = movements.filter(movement_type=movement_type)
        
        serializer = StockMovementSerializer(movements, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = StockMovementSerializer(data=request.data)
        if serializer.is_valid():
            product = serializer.validated_data['product']
            movement_type = serializer.validated_data['movement_type']
            quantity = serializer.validated_data['quantity']
            
            # Mettre à jour le stock
            if movement_type == 'in':
                product.quantity += quantity
            elif movement_type == 'out':
                product.quantity -= quantity
            
            product.save()
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StockMovementDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_object(self, pk):
        try:
            return StockMovement.objects.get(pk=pk)
        except StockMovement.DoesNotExist:
            return None
    
    def put(self, request, pk):
        movement = self.get_object(pk)
        if movement is None:
            return Response({'detail': 'Mouvement non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        product = movement.product
        old_quantity = movement.quantity
        old_movement_type = movement.movement_type
        
        # Annuler l'ancien mouvement
        if old_movement_type == 'in':
            product.quantity -= old_quantity
        elif old_movement_type == 'out':
            product.quantity += old_quantity
        
        serializer = StockMovementSerializer(movement, data=request.data, partial=True)
        if serializer.is_valid():
            new_quantity = serializer.validated_data.get('quantity', old_quantity)
            new_movement_type = serializer.validated_data.get('movement_type', old_movement_type)
            
            # Appliquer le nouveau mouvement
            if new_movement_type == 'in':
                product.quantity += new_quantity
            elif new_movement_type == 'out':
                product.quantity -= new_quantity
            
            product.save()
            serializer.save()
            return Response(serializer.data)
        
        # En cas d'erreur, restaurer l'ancien stock
        if old_movement_type == 'in':
            product.quantity += old_quantity
        elif old_movement_type == 'out':
            product.quantity -= old_quantity
        product.save()
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        movement = self.get_object(pk)
        if movement is None:
            return Response({'detail': 'Mouvement non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        product = movement.product
        
        # Annuler le mouvement sur le stock
        if movement.movement_type == 'in':
            product.quantity -= movement.quantity
        elif movement.movement_type == 'out':
            product.quantity += movement.quantity
        
        product.save()
        movement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============= TABLEAU DE BORD =============

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        products = Product.objects.all()
        
        total_products = products.count()
        low_stock_products = sum(1 for p in products if p.is_low_stock)
        total_stock_value = sum(p.total_value for p in products)
        
        seven_days_ago = datetime.now() - timedelta(days=7)
        recent_movements = StockMovement.objects.filter(
            created_at__gte=seven_days_ago
        ).count()
        
        products_by_category = {}
        for product in products:
            category = product.category or 'Non catégorisé'
            products_by_category[category] = products_by_category.get(category, 0) + 1
        
        data = {
            'total_products': total_products,
            'low_stock_products': low_stock_products,
            'total_stock_value': total_stock_value,
            'recent_movements': recent_movements,
            'products_by_category': products_by_category,
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)


# ============= CATÉGORIES =============

class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = Product.objects.values_list('category', flat=True).distinct()
        categories = [c for c in categories if c]
        return Response({'categories': categories})