#!/bin/bash

function usage()
{
    echo "Publishes docker images for webcron."
    echo ""
    echo "./publish.sh"
    echo "\t-h --help"
    echo "\t--prod"
    echo ""
}

UPLOAD_PROD=0

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    case $PARAM in
        -h | --help)
            usage
            exit
            ;;
        -p | -prod | --prod)
            UPLOAD_PROD=1
            ;;
        *)
            echo "ERROR: unknown parameter \"$PARAM\""
            usage
            exit 1
            ;;
    esac
    shift
done

if (( $UPLOAD_PROD == 1 )); then
  set -x
  docker tag jeremyje/webcron:canary jeremyje/webcron:latest
  docker push jeremyje/webcron:latest
  set +x
else
  set -x
  docker push jeremyje/webcron:canary
  set +x
fi
