import traceback
import os
import cherrypy
from vowelpro import vowel
import json


# Absolute directory path of this file.
DIR_PATH = os.path.dirname(os.path.abspath(__file__))
GLOBAL_CONFIG_FILE_PATH = 'server.conf'


class VowelPro(object):
    @cherrypy.expose
    def index(self):
        return file(os.path.join(DIR_PATH, "index.html"))

class VowelProWebService(object):
    exposed = True

    def POST(self, file, vowel_str, dialect):
        try:
            return json.dumps(vowel.rate_vowel(file.file, vowel_str, dialect, 'wav'))
        except Exception as e:
            cherrypy.log(str(e), traceback=True)
            return json.dumps({
                'error': str(e)
            })

# Global config.
if os.path.exists(GLOBAL_CONFIG_FILE_PATH):
    # Custom config.
    cherrypy.config.update(GLOBAL_CONFIG_FILE_PATH)
else:
    # Default config.
    cherrypy.config.update({
        'server.socket_host': '127.0.0.1',
        'server.socket_port': 8080,
        'log.access_file': 'access.log',
        'log.error_file': 'error.log'
    })

# Configure app.
conf = {
    '/': {
        'tools.sessions.on': True,
        'tools.staticdir.root': DIR_PATH
    },
    '/rate': {
        'request.dispatch': cherrypy.dispatch.MethodDispatcher(),
        'tools.response_headers.on': True,
        'tools.response_headers.headers': [('Content-Type', 'application/json')],
    },
    '/static': {
        'tools.staticdir.on': True,
        'tools.staticdir.dir': 'static'
    }
}

webapp = VowelPro()
webapp.rate = VowelProWebService()
cherrypy.quickstart(webapp, '/', conf)
