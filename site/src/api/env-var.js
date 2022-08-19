export default function handler(_req, res){
    res.json({
        GATSBY_PUBLIC_VAULE: process.env.GATSBY_PUBLIC_VAULE,
        SECRET_VALUE: process.env.SECRET_VALUE,
    })
}