let ficha = 
{
    nome: 'Fabricio',
    sexo: 'M',
    peso:  69.3,
    ganharmassa(p = 0)
    {
        console.log('Cresceu!')
        this.peso += p
    }
}
ficha.ganharmassa(2)
console.log(`${ficha.nome} pesa ${ficha.peso}Kg`)