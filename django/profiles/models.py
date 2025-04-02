from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', blank=True, null=True)
    matches_won = models.PositiveIntegerField(default=0)
    matches_lost = models.PositiveIntegerField(default=0)
    gol_scored = models.PositiveIntegerField(default=0)
    gol_conceded = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, choices=[('online', 'Online'), ('away', 'Away'), ('offline', 'Offline')], default='offline')
    profile_image = models.CharField(max_length=255, blank=True, null=True, default='/static/images/user/default.jpg')
    intra_username = models.CharField(max_length=255, blank=True, null=True)
    friends = models.ManyToManyField(User, blank=True)

    def __str__(self):
        return f'{self.user.username} - Profile'
    
    def winRate(self):
        if self.matches_won == 0:
            return 0
        return int((self.matches_won / (self.matches_won + self.matches_lost)) * 100)
    
    def lostRate(self):
        if self.matches_lost == 0:
            return 0
        return int((self.matches_lost / (self.matches_won + self.matches_lost)) * 100)
    
    def hitGolRate(self):
        if self.gol_scored == 0:
            return 0
        return int((self.gol_scored / (self.gol_scored + self.gol_conceded)) * 100)
    
    def concededGolRate(self):
        if self.gol_conceded == 0:
            return 0
        return int((self.gol_conceded / (self.gol_scored + self.gol_conceded)) * 100)
    
    def score(self):
        win_rate = self.winRate()
        hit_gol_rate = self.hitGolRate()
        
        score = (win_rate * 3) + (hit_gol_rate * 2)

        return round(score)
    
    def friendsCount(self):
        return self.friends.count()
    
    def getFriendRequests(self):
        return FriendRequest.objects.filter(to_user=self.user)
    
class FriendRequest(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='from_user')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='to_user')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f'{self.from_user.username} --> {self.to_user.username}'