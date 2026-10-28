const AdminModel = require('../models/adminModel');
const { handleError } = require('../utils/httpError');

const AdminController = {

    //Get /api/admin
    getAll: async (req, res) => {
        try {
            const admin = await AdminModel.getAll();
            res.json({success: true, data: admin});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    getAllAktif: async (req, res) => {
        try {
            const admin = await AdminModel.getAllAktif();
            res.json({success: true, data: admin});
        } catch  (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    getById: async (req, res) => {
        try {   
            const admin = await AdminModel.getById(req.params.id);
            if(!admin) {
                res.status(404).json({ success: false, message: 'Admin not found'});
            }
            res.json({success:true, data:admin});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    getByIdAktif: async (req, res) => {
        try{
            const admin = await AdminModel.getByIdAktif(req.params.id);
            if(!admin) {
                res.status(404).json({ success: false, message: 'Admin not found'});
            }
            res.json({success: true, data: admin});
        } catch ( error ) {
            return handleError(res, error, 'AdminController');
        }
        
    },

    create: async (req, res) => {
        try {
            const result = await AdminModel.create(req.body);
            res.json({ success: true, message: 'Admin created successfully'});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    update: async (req, res) => {
        try {
            const result = await AdminModel.update(req.params.id, req.body);
            // if(result.affectedRows === 0 ) {
            //     res.status(404).json({success: false, message: error.message});
            // }
            await AdminModel.getById(req.params.id);
            res.json({success: true, message: 'Admin updated successfully'});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    deaktivasi: async (req, res) => {
        try{
            await AdminModel.deaktivasiAdmin(req.params.id, req.user.id);
            res.json({success: true, message: 'Admin berhasil dinonaktifkan'});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
    },

    aktivasi: async (req, res) => {
        try{
            await AdminModel.aktivasiAdmin(req.params.id);
            res.json({success: true, message: 'Admin activated successfully'});
        } catch (error) {
            return handleError(res, error, 'AdminController');
        }
        
    }
}


module.exports = AdminController;