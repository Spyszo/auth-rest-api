# REST API
 API do rejestracji i logowania użytkowników

Przed uruchomieniem utworzyć pilk .env z następującymi zmiennymi:

    PRODUCTION=<true|false>
    MONGODB_CONNECTION_STRING=<Wygenerowany string przez mongodb>
    JWT_SECRET=<Wygenerowany losowy string>
    NODEMAILER_EMAIL=<E-mail do konta GMAIL>
    NODEMAILER_EMAIL_PASSWORD=<Hasło do konta GMAIL>
    GOOGLE_CLIENTID=<Client ID wygenerowany przez Google API>
    GOOGLE_CLIENTSECRET=<Sekret wygenerowany przez Google API>
    FACEBOOK_CLIENTID=<Client ID wygenerowany przez Facebook API>
    FACEBOOK_CLIENTSECRET=<Sekret wygenerowany przez Facebook API>
    PORT=<Port na jakim będzie działać api>
    HOST=<Nazwa hosta; lokalnie localhost>
    SSL=<true|false>
 
 API korzysta z bazy danych mongodb. Przed uruchomieniem api należy wygenerować odpowiedni string do połączenia się z mongodb.
 
 Dostępne Endpointy (POST): 
 
    /api/auth/register
    /api/auth/login
    /api/auth/verify
    /api/auth/delete
    /api/auth/logout
 
    /api/account/activateAccount
    /api/account/forgotPassword
    /api/account/verifyResetToken
    /api/account/resetPassword
    /api/account/changePassword
 
 
# Do zrobienia
 - protokół https
 - opis każdego endpointa
 - logowanie z google/facebook
