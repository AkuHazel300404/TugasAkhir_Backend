const CustomerModel = require('../models/customerModel');

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
            res.status(500).json({message: 'Dia Lari Ke Sini'});
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
            res.status(500).json({message: 'Internal Server Error'});
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
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    update: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.update(id_customer, req.body);
            return res.status(200).json({message: 'Data customer berhasil diubah'});
        }catch(error){
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    blacklist: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.blacklist(id_customer);
            return res.status(200).json({message: 'Customer berhasil di blacklist'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    whitelist: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.whitelist(id_customer);
            return res.status(200).json({message: 'Customer berhasil di whitelist'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    delete: async (req, res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.delete(id_customer);
            return res.status(200).json({message: 'Data customer berhasil di hapus'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    deactivate: async (req,res) => {
        try{
            const {id_customer} = req.params;
            const result = await CustomerModel.deactivate(id_customer);
            return res.status(200).json({message: 'Data customer berhasil di non-aktifkan'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },
};

module.exports = CustomerController;