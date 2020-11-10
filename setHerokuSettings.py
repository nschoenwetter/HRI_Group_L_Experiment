from psiturk.psiturk_config import PsiturkConfig
import subprocess
import sys

CONFIG = PsiturkConfig()
CONFIG.load_config()

sections = ['psiTurk Access','AWS Access']
for section in sections:
    for item in CONFIG.items(section):
        #print 'heroku config:set ' + '='.join(item) + ' -a ' + sys.argv(1)
        subprocess.call('heroku config:set ' + '='.join(item) + ' -a ' + sys.argv[1], shell=True)


subprocess.call('heroku config:set ON_HEROKU=true -a ' + sys.argv[1], shell=True)
