#!/usr/bin/env sh

version="0.0.11"

info() {
  echo -e "\e[92m$1\e[0m"
}

error() {
  echo -e "\e[91mError! $1\e[0m"
}

run() {
  command="$@"
  if [ -z ${noroot+x} ]; then
    if [ -x "$(command -v sudo)" ]; then
      sudo $command
    else
      su root -c "$command"
    fi
  else
    $command
  fi
}

checkdeps() {
  if ! { [ -x "$(command -v fetch)" ] || [ -x "$(command -v wget)" ] || [ -x "$(command -v curl)" ]; }; then
    error "This script needs one of: fetch, wget or curl"
    exit 1
  elif ! { [ -x "$(command -v npm)" ] && [ -x "$(command -v node)" ]; }; then
    error "This script needs npm and node"
    exit 1
  elif ! [ -x "$(command -v cmake)" ]; then
    error "This script needs cmake"
    exit 1
  elif ! [ -x "$(command -v tar)" ]; then
    error "This script needs tar"
    exit 1
  elif ! [ -x "$(command -v whoami)" ]; then
    error "This script needs whoami"
    exit 1
  fi
}

getvars() {
  bundle="bundle.tar.gz"
  dirname="alien*"
  tarball="https://github.com/alien-sh/alien/archive/v$version.tar.gz"
  if [ -d "./.git" ]; then
    checkout="YES"
  fi
}

getargs() {
  while [ "$#" -gt 0 ]
    do
      case "$1" in
        -p|--prefix)
        shift
        prefix="$1"
        ;;
        -p=*|--prefix=*)
        prefix="${1#*=}"
        ;;
        -np|--no-plugins)
        noplugins="YES"
        ;;
        -nr|--no-root)
        noroot="YES"
        ;;
        *)
        error "Unknown option '$key'"
        exit 1
        ;;
      esac
      shift
    done
}

checkargs() {
  if [ -z ${prefix+x} ]; then
    info "Prefix not set, setting to /usr/local"
    prefix="/usr/local"
  fi
}

download() {
  if ! [ -z ${checkout+x} ]; then
    info "Skipping download"
    return 0
  fi
  info "Downloading: $tarball"
  if [ -x "$(command -v fetch)" ]; then
    fetch $tarball -o $bundle
  elif [ -x "$(command -v wget)" ]; then
    wget $tarball -O $bundle
  elif [ -x "$(command -v curl)" ]; then
    curl $tarball --output $bundle
  fi
}

maketemp() {
  if ! [ -z ${checkout+x} ]; then
    info "Skipping temp dir creation"
    return 0
  fi
  tmpdir=$(mktemp -d -t al-XXXXXXXXXX)
  info "Created temp dir: $tmpdir"
  cd $tmpdir
}

untar() {
  if ! [ -z ${checkout+x} ]; then
    return 0
  fi
  tar xzf $bundle
  cd $dirname
}

install() {
  if ! [ -z ${checkout+x} ]; then
    info "Installing from checkout"
  fi
  info "Installing dependencies"
  npm install
  info "Installing in $prefix"
  run "npm install --prefix $prefix -g . && node build.js $prefix"
}

homesetup() {
  cd ~
  if ! [ -d ".alien" ]; then
    mkdir ".alien"
  fi
  if ! [ -z ${noplugins+x} ]; then
    info "Skipping plugin install"
    return 0
  fi
  cd ".alien"
  if ! [ -f "package.json" ]; then
    configdir="$(whoami)-alien-config"
    mkdir $configdir
    cd $configdir
    npm init -y
    mv "package.json" ..
    rm -rf $configdir
  fi
  npm i -S "@alien.sh/core-plugins"
}

main() {
  checkdeps
  getvars
  getargs $@
  checkargs
  maketemp
  download
  untar
  install
  homesetup
  info "Install done."
}

main $@
