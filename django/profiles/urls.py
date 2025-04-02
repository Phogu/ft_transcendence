from django.urls import path
from . import views

urlpatterns = [
    path('', views.profiles, name='profiles'),
    path('raw/', views.profilesRaw, name='profilesRaw'),
    path('<str:username>/', views.profileOther, name='profile'),
    path('<str:username>/raw/', views.profileOtherRaw, name='profileRaw'),
    path('api/updatepp/', views.updateProfilePicture, name='updateProfilePicture'),
    path('api/updatepi/', views.updateProfileInfo, name='updateProfileInfo'),
    path('api/updatepw/', views.updateProfilePassword, name='updateProfilePassword'),
    path('api/addfriend/', views.addFriendRequest, name='addFriend'),
    path('api/acceptfriend/', views.acceptFriendRequest, name='acceptFriend'),
    path('api/rejectfriend/', views.rejectFriendRequest, name='rejectFriend'),
    path('api/removefriend/', views.removeFriend, name='removeFriend'),
    path('api/getfriendrequests/', views.getFriendRequests, name='getFriendRequests'),
    path('api/get_status/', views.getStatus, name='get_status'),
    path('api/update_status/', views.updateStatus, name='update_status'),
]
