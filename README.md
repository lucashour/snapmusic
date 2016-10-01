# SnapMusic
Idea original: Spotify playlist collaboration through Slack. Brought to you by the lovely people at [Benchmark](http://benchmark.co.uk).

Simplemente crear un Slash Command, como '/play', que acepte el nombre de una canción (pudiendo también agregarse el artista, para una búsqueda más precisa) para agregarla en una playlist colaborativa.

    /play Queen - Bohemian Rhapsody

##Instalación

Antes que nada, crear el Slash Command de Slack desde [Slash Commands](https://my.slack.com/services/new/slash-commands).

Durante la instalación, indicar que el comando le pegue por POST al endpoint '/store' de la aplicación.

Tomar nota del 'token' para usarlo posteriormente.

###Spotify

Entrar a [Spotify's Developer Site](http://developer.spotify.com) y crear una nueva aplicación. Recordar usar como URI de redirección el endpoint '/callback' de la aplicación. Tomar nota del 'client id' y del 'client secret' para usarlo posteriormente.

Por otra parte, elegir una playlist (o crearla) en Spotify y hacerla colaborativa. Tomar nota del 'playlist identifier' para usarlo posteriormente.

###Configuración de variables de entorno

* `SLACK_TOKEN` - Token del Slash Command de Slack.
* `SPOTIFY_KEY` - Client id de Spotify.
* `SPOTIFY_SECRET` - Client Secret de Spotify.
* `SPOTIFY_USERNAME` - Username de Spotify.
* `SPOTIFY_PLAYLIST_ID` - ID de playlist.
* `SPOTIFY_REDIRECT_URI` - URI de redirección.

###Autenticación

Visitar home page de aplicación para autenticarte con tu cuenta de Spotify.
