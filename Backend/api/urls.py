from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentification
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', views.CurrentUserView.as_view(), name='current_user'),
    
    # Utilisateurs
    path('users/', views.UserListView.as_view(), name='user-list'),
    path('users/<str:pk>/', views.UserDetailView.as_view(), name='user-detail'),
    
    # Produits
    path('products/', views.ProductListCreateView.as_view(), name='product-list'),
    path('products/<str:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Mouvements de stock
    path('movements/', views.StockMovementListCreateView.as_view(), name='movement-list'),
    path('movements/<str:pk>/', views.StockMovementDetailView.as_view(), name='movement-detail'),
    
    # Dashboard
    path('dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Catégories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
]