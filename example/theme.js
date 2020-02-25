export const theme = {
    buttons: {
        primary: {
            fontWeight: 'bold',
            color: 'white',
            bg: 'primary',
            '&:hover': {
                bg: 'dark',
            },
        },
    },
    colors: { error: 'red' },
    space: [...Array(50).keys()].map(key => key * 8),
}
