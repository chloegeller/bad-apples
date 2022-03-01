# this file imports custom routes into the experiment server
from __future__ import generator_stop
from pathlib import Path

from omegaconf import OmegaConf
import requests
from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app, send_from_directory
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError, InvalidUsageError
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
from json import dumps, loads

# load the configuration options
config = PsiturkConfig()
config.load_config()
# if you want to add a password protect route, uncomment and use this
#myauth = PsiTurkAuthorization(config)

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__,
                        template_folder='templates', static_folder='static')


###########################################################
#  serving warm, fresh, & sweet custom, user-provided routes
#  add them here
###########################################################

@custom_code.route("/experiments/<path:filename>")
def get_experiment_code(filename: str) -> str:
    """This searches the local filesystem for `/experiments/<codeversion>`.
    Every "codeversion" should have a unique name to keep track of different study 
        designs.
    """
    path = Path("./experiments") / filename
    return send_from_directory(custom_code.root_path + str(path.parent), path.name)

# ----------------------------------------------
# example custom route
# ----------------------------------------------
@custom_code.route('/stimuli', methods=["GET"])
def get_stimuli():
    """Fetches the stimulus configuration file and pipes it through `OmegaConf`.
    """
    codeversion = request.args.get("codeversion")

    config = Path("experiments") / codeversion / "config.yaml"
    config = OmegaConf.load(config)
    # Converts references, like "The ${probe} gets %-age of my time" into the actual
    #   value of "${probe}"
    OmegaConf.resolve(config)

    stimuli = OmegaConf.to_container(config.stimuli, resolve=True)
    return jsonify(stimuli)

# ----------------------------------------------
# example using HTTP authentication
# ----------------------------------------------
#@custom_code.route('/my_password_protected_route')
#@myauth.requires_auth
#def my_password_protected_route():
#    try:
#        return render_template('custom.html')
#    except TemplateNotFound:
#        abort(404)

# ----------------------------------------------
# example accessing data
# ----------------------------------------------
#@custom_code.route('/view_data')
#@myauth.requires_auth
#def list_my_data():
#    users = Participant.query.all()
#    try:
#        return render_template('list.html', participants=users)
#    except TemplateNotFound:
#        abort(404)

# ----------------------------------------------
# example computing bonus
# ----------------------------------------------


@custom_code.route('/compute_bonus', methods=['GET'])
def compute_bonus():
    # check that user provided the correct keys
    # errors will not be that gracefull here if being
    # accessed by the Javascrip client
    if not 'uniqueId' in request.args:
        # i don't like returning HTML to JSON requests...  maybe should change this
        raise ExperimentError('improper_inputs')
    uniqueId = request.args['uniqueId']

    try:
        # lookup user in database
        user = Participant.query.\
            filter(Participant.uniqueid == uniqueId).\
            one()
        user_data = loads(user.datastring)  # load datastring from JSON
        bonus = 0

        for record in user_data['data']:  # for line in data file
            trial = record['trialdata']
            if trial['phase'] == 'TEST':
                if trial['hit'] == True:
                    bonus += 0.02
        user.bonus = bonus
        db_session.add(user)
        db_session.commit()
        resp = {"bonusComputed": "success"}
        return jsonify(**resp)
    except:
        abort(404)  # again, bad to display HTML, but...
