#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>

int main(int argc, char *argv[]) {

  int status;
  pid_t pid = fork();

  /* Ignore signals from keyboard */
  signal(SIGINT, SIG_IGN);
  signal(SIGTSTP, SIG_IGN);
  signal(SIGQUIT, SIG_IGN);

  if (pid == 0) {

    char ppid[12];
    sprintf(ppid, "%d", getppid());
    char *aargv[4] = {"alien-js", ppid, NULL};
    execvp( "alien-js", aargv );
    printf("Count not launch alien shell...\n");
    exit(0);

  } else {

    while (wait(&status) != pid);
    return status;

  }

  //system("node index.js");
}
