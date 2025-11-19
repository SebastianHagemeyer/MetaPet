#!/bin/sh

##############################################################################
# Gradle startup script for UN*X
##############################################################################

# Attempt to set APP_HOME
APP_HOME=$(cd "$(dirname "$0")" && pwd)

# Add default JVM options here.
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'

exec "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" "$@"
