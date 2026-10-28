const CustomerModel = require('../models/customerModel');
const { handleError } = require('../utils/httpError');

const CustomerController = {
    getAll: async (req, res) => {
        try {
            const { tipe_tamu, is_blacklist, search } = req.query;
            const customer = await CustomerModel.getAll(req.query);
            if(!customer){
                return res.status(404).json({message: 'Tamu tidak ditemukan'});
            }
            return res.status(200).json({data: customer, total: customer.length});
        } catch (error) {
            console.error('Kamar getAll error:', error);
            return handleError(res, error, 'CustomerController getAll');
        }
    },

    getAllData: async (req, res) => {
        try {
            const { is_blacklist, search } = req.query;
            const customer = await CustomerModel.getAllData(req.query);
            if(!customer){
                return res.status(404).json({message: 'Tamu tidak ditemukan'});
            }
            return res.status(200).json({data: customer, total: customer.length})
        } catch (error) {
            console.error('Kamar getAll error:', error);
            return res.status(500).json({message: 'Internal Server Error'});
        }
    },

    getById: async (req, res) => {
        try {
            const { id_customer } = req.params;
            const customer = await CustomerModel.getById(id_customer);
            if(!customer){
                return res.status(404).json({message: 'Customer tidak ditemukan'});
            }
            return res.status(200).json({data: customer})
        } catch(error) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
    },

    create: async (req, res) => {
        try{
            const result = await CustomerModel.create(req.body);
            res.status(200).json({message: 'Data customer berhasil disimpan'});
        }catch(error){
            return res.status(500).json({message: 'Internal Server Error'});
        }
    },

    update: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.update(id_customer, req.body);
            return res.status(200).json({message: 'Data customer berhasil diubah'});
        }catch(error){
            return res.status(500).json({message: 'Internal Server Error'});
        }
    },

    blacklist: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.blacklist(id_customer);
            return res.status(200).json({message: 'Customer berhasil di blacklist'});
        }catch(error){
            return handleError(res, error, 'CustomerController');
        }
    },

    whitelist: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.whitelist(id_customer);
            return res.status(200).json({message: 'Customer berhasil di whitelist'});
        }catch(error){
            return handleError(res, error, 'CustomerController');
        }
    },

    delete: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.delete(id_customer);
            return res.status(200).json({message: 'Data customer berhasil di hapus'});
        }catch(error){
            return handleError(res, error, 'CustomerController');
        }
    },

    deactivate: async (req,res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.deactivate(id_customer);
            return res.status(200).json({message: 'Data customer berhasil di non-aktifkan'});
        }catch(error){
            return handleError(res, error, 'CustomerController');
        }
    },
};

module.exports = CustomerController;