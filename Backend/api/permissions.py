from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """
    Permission pour les administrateurs uniquement
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'


class IsAdminOrEmployee(permissions.BasePermission):
    """
    Permission pour les administrateurs et employés
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role in ['admin', 'employee']
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Les admins peuvent tout faire, les autres peuvent seulement lire
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Les admins peuvent tout faire
        if request.user.role == 'admin':
            return True
        
        # Les autres peuvent seulement lire
        return request.method in permissions.SAFE_METHODS


class CanModifyStock(permissions.BasePermission):
    """
    Permission pour modifier le stock (Admin et Employé)
    Les viewers peuvent seulement consulter
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Tout le monde authentifié peut lire
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Seuls Admin et Employé peuvent modifier
        return request.user.role in ['admin', 'employee']


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    L'utilisateur peut modifier ses propres données ou être admin
    """
    def has_object_permission(self, request, view, obj):
        # Les admins peuvent tout faire
        if request.user.role == 'admin':
            return True
        
        # Les utilisateurs peuvent voir leurs propres données
        if request.method in permissions.SAFE_METHODS:
            return obj == request.user
        
        # Seuls les admins peuvent modifier les utilisateurs
        return False