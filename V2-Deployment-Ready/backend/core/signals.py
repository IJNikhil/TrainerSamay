# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from django.conf import settings
# from rest_framework.authtoken.models import Token

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def set_role_for_superuser(sender, instance, created, **kwargs):
#     # Automatically set role to 'admin' for new superusers
#     if created and getattr(instance, 'is_superuser', False) and getattr(instance, 'role', None) != 'admin':
#         instance.role = 'admin'
#         instance.save(update_fields=['role'])

# @receiver(post_save, sender=settings.AUTH_USER_MODEL)
# def create_auth_token(sender, instance=None, created=False, **kwargs):
#     # Automatically create a token for every new user
#     if created:
#         Token.objects.get_or_create(user=instance)

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from rest_framework.authtoken.models import Token

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def set_role_and_staff_for_superuser(sender, instance, created, **kwargs):
    changed = False
    if created and getattr(instance, 'is_superuser', False):
        if getattr(instance, 'role', None) != 'admin':
            instance.role = 'admin'
            changed = True
        if not instance.is_staff:
            instance.is_staff = True
            changed = True
        if changed:
            instance.save(update_fields=['role', 'is_staff'])

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    if created:
        Token.objects.get_or_create(user=instance)
