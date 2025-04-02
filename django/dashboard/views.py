from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from game.models import Match

# Create your views here.
@login_required(login_url='/login/')
def dashboard(request):
    matches = Match.objects.filter(player1=request.user) | Match.objects.filter(player2=request.user)
    return render(request, 'base.html', {'current_page': 'dashboard/index.html', 'matches': matches})

@login_required(login_url='/login/')
def dashboardRaw(request):
    matches = Match.objects.filter(player1=request.user) | Match.objects.filter(player2=request.user)
    return render(request, 'dashboard/index.html', {'matches': matches})