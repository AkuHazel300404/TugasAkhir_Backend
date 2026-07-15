const AdminModel = require('../models/adminModel');

const AdminController = {

    //Get /api/admin
    getAll: async (req, res) => {
        try {
            const admin = await AdminModel.getAll();
            res.json({success: true, data: admin});
        } catch (error) {
            res.status(500).json({success: false, message: error.message});
        }
    },

    getAllAktif: async (req, res) => {
        try {
            const admin = await AdminModel.getAllAktif();
            res.json({success: true, data: admin});
        } catch  (error) {
            res.status(500).json({success: false, message: error.message});
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
            res.status(500).json({success: false, message: error.message});
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
            res.status(500).json({success: false, message: error.message});
        }
        
    },

    create: async (req, res) => {
        try {
            const result = await AdminModel.create(req.body);
            res.json({ success: true, message: 'Admin created successfully'});
        } catch (error) {
            res.status(500).json({success: false, message: error.message});
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
            res.status(500).json({success: false, message: error.message});
        }
    },

    deaktivasi: async (req, res) => {
        try{
            await AdminModel.deaktivasiAdmin(req.params.id);
            res.json({success: true, message: 'Admin deactivated successfully'});
        } catch (error) {
            res.status(500).json({success: false, message: error.message});
        }
    },

    aktivasi: async (req, res) => {
        try{
            await AdminModel.aktivasiAdmin(req.params.id);
            res.json({success: true, message: 'Admin activated successfully'});
        } catch (error) {
            res.status(500).json({success:false, message: error.message});
        }
        
    }
}


module.exports = AdminController;