#!/bin/bash

# start vite
npm i; npm run dev &

# trap SIGINT and SIGTERM signals and gracefully exit
trap "echo \"Killing the vite server\"; kill \$!; exit" SIGINT SIGTERM

# wait until the vite server is stopped
wait $!
