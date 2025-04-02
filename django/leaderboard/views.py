from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from profiles.models import UserProfile

@login_required(login_url='/login/')
def leaderboard(request):
    users = UserProfile.objects.all()
    sorted_users = sorted(users, key=lambda user: user.score(), reverse=True)

    firstUser = sorted_users[0] if len(sorted_users) > 0 else None
    secondUser = sorted_users[1] if len(sorted_users) > 1 else None
    thirdUser = sorted_users[2] if len(sorted_users) > 2 else None

    remaining_users = sorted_users[3:]

    return render(request, 'base.html', {
        'current_page': 'leaderboard/index.html',
        'first': firstUser,
        'second': secondUser,
        'third': thirdUser,
        'remaining_users': remaining_users,
    })

@login_required(login_url='/login/')
def leaderboardRaw(request):
    users = UserProfile.objects.all()
    sorted_users = sorted(users, key=lambda user: user.score(), reverse=True)

    firstUser = sorted_users[0] if len(sorted_users) > 0 else None
    secondUser = sorted_users[1] if len(sorted_users) > 1 else None
    thirdUser = sorted_users[2] if len(sorted_users) > 2 else None

    remaining_users = sorted_users[3:]
    return render(request, 'leaderboard/index.html', {
        'current_page': 'leaderboard/index.html',
        'first': firstUser,
        'second': secondUser,
        'third': thirdUser,
        'remaining_users': remaining_users,
    })