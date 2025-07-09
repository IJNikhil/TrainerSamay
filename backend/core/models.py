from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, name, role, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, role, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, name, role, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('trainer', 'Trainer'),
    )
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    avatar = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'role']

    objects = UserManager()

    def __str__(self):
        return self.name

class Session(models.Model):
    class Meta:
        db_table = 'trainer_utilization'
        
    SESSION_TYPE_CHOICES = (
        ('Yoga', 'Yoga'),
        ('Strength', 'Strength'),
        ('Cardio', 'Cardio'),
        ('Consultation', 'Consultation'),
    )
    STATUS_CHOICES = (
        ('Scheduled', 'Scheduled'),
        ('Started', 'Started'),    
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Absent', 'Absent'),
    )
    id = models.AutoField(primary_key=True)
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)
    batch = models.CharField(max_length=100)
    sessionType = models.CharField(max_length=20, choices=SESSION_TYPE_CHOICES)
    date = models.DateTimeField()
    duration = models.IntegerField()
    location = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)

    def __str__(self):
        return f"{self.sessionType} - {self.batch} ({self.date})"

class Availability(models.Model):
    DAYS = (
        ('Sunday', 'Sunday'),
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    )
    trainer = models.ForeignKey(User, on_delete=models.CASCADE)
    day = models.CharField(max_length=10, choices=DAYS)
    startTime = models.TimeField()
    endTime = models.TimeField()

    class Meta:
        unique_together = ('trainer', 'day')

    def __str__(self):
        return f"{self.trainer} - {self.day} {self.startTime}-{self.endTime}"
