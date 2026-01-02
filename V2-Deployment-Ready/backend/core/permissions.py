from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsTrainer(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'trainer')

class IsAdminOrTrainerReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        if request.method in permissions.SAFE_METHODS and \
           request.user and request.user.is_authenticated and request.user.role == 'trainer':
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        if request.method in permissions.SAFE_METHODS and \
           request.user and request.user.is_authenticated and request.user.role == 'trainer':
            return obj == request.user
        return False

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'trainer'])

    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated and request.user.role == 'admin':
            return True
        if request.user and request.user.is_authenticated and request.user.role == 'trainer':
            return hasattr(obj, 'trainer') and obj.trainer == request.user
        return False

class IsBookingOwnerOrTrainerOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        if hasattr(obj, 'trainer') and obj.trainer == request.user:
            if request.method in permissions.SAFE_METHODS:
                return True
            # Allow trainer to update only 'status' and 'notes' fields
            if set(request.data.keys()) <= {'status', 'notes'}:
                return True
        return False

class IsSelfOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user and request.user.is_authenticated:
            if request.user.role == 'admin':
                return True
            # For trainer, only allow access to their own profile (obj.user is related user)
            if hasattr(obj, 'user'):
                return obj.user == request.user
        return False

class IsTrainerSessionOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        if request.user.role == 'trainer' and obj.trainer == request.user:
            # Only allow feedback/status update
            if request.method in ['PATCH', 'PUT']:
                allowed_fields = set(request.data.keys())
                return allowed_fields <= {'status', 'feedback'}
            return request.method in permissions.SAFE_METHODS
        return False
