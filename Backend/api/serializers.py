from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Product, StockMovement


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'viewer'),
            phone=validated_data.get('phone', '')
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Identifiants incorrects")


class ProductSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    total_value = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'reference', 'quantity', 
            'min_quantity', 'unit_price', 'category', 'location',
            'is_low_stock', 'total_value', 'created_at', 'updated_at',
            'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']


class StockMovementSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = [
            'id', 'product', 'product_name', 'movement_type', 
            'quantity', 'reason', 'reference_document',
            'created_at', 'created_by', 'created_by_username'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']
    
    def validate(self, data):
        # Vérifier que la quantité est positive
        if data['quantity'] <= 0:
            raise serializers.ValidationError("La quantité doit être positive")
        
        # Vérifier le stock disponible pour les sorties
        if data['movement_type'] == 'out':
            product = data['product']
            if product.quantity < data['quantity']:
                raise serializers.ValidationError(
                    f"Stock insuffisant. Disponible: {product.quantity}"
                )
        
        return data


class DashboardStatsSerializer(serializers.Serializer):
    total_products = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    total_stock_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    recent_movements = serializers.IntegerField()
    products_by_category = serializers.DictField()