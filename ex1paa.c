#include <stdio.h>



void main(){
int n;
int *vet;

    scanf("%d", &n);
    vet = (int *) malloc(n * sizeof(int));

    for(int i=0 ; i<n ; i++){

        scanf("%d", &vet[i]);

    }


    for(int i=0 ; i<n ; i++){

        printf("%d ", vet[i]);

    }
    free(vet);
}