import express from 'express';
import __dirname from '../utils/utils.js';
// import ProductManagerFS from '../dao/ProductManagerFS.js';
import ProductManagerDB from '../dao/ProductManagerDB.js';
import productModel from '../dao/models/productModel.js';

const router = express.Router();

// const PM = new ProductManagerFS(`${__dirname}/../Productos.json`);
const PM = new ProductManagerDB();

router.get('/', async (req, res) => {
    let { page = 1, limit = 10, sort, query } = req.query;

    // Convertir el string de sort a un objeto si es necesario
    if (sort) {
        sort = JSON.parse(sort);
    } else {
        sort = { _id: 'asc' }; // Ordenar por defecto por _id ascendente si no se especifica el sort
    }

    // Crear objeto de opciones para paginate-v2
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: sort,
        lean: true // Devuelve documentos como objetos JavaScript planos en lugar de instancias de modelo de Mongoose
    };

    // Crear opciones de consulta basadas en el query
    const queryOptions = query ? { title: { $regex: query, $options: 'i' } } : {};

    try {
        
        const result = await productModel.paginate(queryOptions, options);

        const baseURL = "http://localhost:8080";
        result.prevLink = result.hasPrevPage ? `${baseURL}?page=${result.prevPage}&limit=${limit}&sort=${JSON.stringify(sort)}` : "";
        result.nextLink = result.hasNextPage ? `${baseURL}?page=${result.nextPage}&limit=${limit}&sort=${JSON.stringify(sort)}` : "";
        result.isValid = !(page <= 0 || page > result.totalPages);

        console.log("Productos obtenidos con éxito");
        res.render('index', {
            products: result.docs,
            style: 'index.css',
            ...result
        });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).send('Error al obtener los productos');
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await PM.getProducts();
        res.render('realtimeproducts', {
            products,
            style: 'index.css'
        });
    } catch (error) {
        console.error("Error al obtener productos en tiempo real:", error);
        res.status(500).send('Error al obtener los productos en tiempo real');
    }
});

router.get('/addproduct', (req, res) => {
    res.render('addproduct', {
        style: 'index.css'
    });
});

router.get('/deleteproduct', async (req, res) => {
    res.render('deleteproduct', {
        style: 'index.css'
    });
});

router.get('/chat', async (req,res) => {
    res.render('chat', {
        style: 'chat.css'
    });
})

export default router;