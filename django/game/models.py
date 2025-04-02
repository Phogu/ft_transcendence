from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Match(models.Model):
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='player2')
    player1_score = models.PositiveIntegerField(default=0)
    player2_score = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.player1.username} vs {self.player2.username}'
    
    def winner(self):
        if self.player1_score > self.player2_score:
            return self.player1
        elif self.player1_score < self.player2_score:
            return self.player2
        else:
            return None