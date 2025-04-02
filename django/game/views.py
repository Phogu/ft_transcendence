from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .models import Match
from profiles.models import UserProfile
import json
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist

# Create your views here.
@login_required(login_url='/login/')
def game(request):
    return render(request, 'game/index.html', {'friends': request.user.profile.friends.all()})

@login_required(login_url='/login/')
def gameRaw(request):
    return render(request, 'game/index.html', {'friends': request.user.profile.friends.all()})

@login_required(login_url='/login/')
def saveMatch(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Invalid request method'}, status=405)
    
    try:
        data = json.loads(request.body)
        player1 = data.get('player1')
        player2 = data.get('player2')
        player1_score = data.get('player1_score')
        player2_score = data.get('player2_score')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    
    if not player1 or not player2 or player1_score is None or player2_score is None:
        return JsonResponse({'error': 'Missing data'}, status=400)
    
    try:
        player1 = User.objects.get(username=player1)
        player2 = User.objects.get(username=player2)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    match = Match(player1=player1, player2=player2, player1_score=player1_score, player2_score=player2_score)
    match.save()

    try:
        player1_profile = player1.profile
        player2_profile = player2.profile

        if player1_score > player2_score:
            player1_profile.matches_won += 1
            player2_profile.matches_lost += 1
        elif player1_score < player2_score:
            player1_profile.matches_lost += 1
            player2_profile.matches_won += 1

        player1_profile.gol_scored += player1_score
        player1_profile.gol_conceded += player2_score

        player2_profile.gol_scored += player2_score
        player2_profile.gol_conceded += player1_score

        player1_profile.save()
        player2_profile.save()
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'Profile not found'}, status=404)

    return JsonResponse({'success': 'Match saved'}, status=201)