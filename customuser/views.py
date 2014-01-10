from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.template import RequestContext, loader
from django.contrib.auth.forms import AuthenticationForm

def login(request):
    email = ''
    password = ''
    state = "Please login below: "

    form = AuthenticationForm(data=(request.POST or None))

    if form.is_valid():
        # Since the USERNAME_FIELD in custom-user is the email, that is what
        # we expect as input to the username field of this form
        email = form.cleaned_data['username']
        password = form.cleaned_data['password']

        user = authenticate(username=email,password=password)

        if user is not None and user.is_active:
            login(request,user)
            state = "You have been logged in"
        else:
            state = "Invalid login credentials"

    t = loader.get_template('login.html')
    c = RequestContext(request, {'state': state, 'form': form})
    return HttpResponse(t.render(c))
