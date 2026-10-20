const UserModel = require('../models/userModel');

const UserController = {
    getAll: async (req, res) => {
        try {
            const { tipe_tamu, is_blacklist, search } = req.query;
            const user = await UserModel.getAll(req.query);
            if(!user){
                return res.status(404).json({message: 'User tidak ditemukan'});
            }
            return res.status(200).json({data: user, total: user.length});
        } catch (error) {
            console.error('Kamar getAll error:', error);
            res.status(500).json({message: 'Dia Lari Ke Sini'});
        }
    },

    getAllData: async (req, res) => {
        try {
            const { is_blacklist, search } = req.query;
            const user = await UserModel.getAllData(req.query);
            if(!user){
                return res.status(404).json({message: 'User tidak ditemukan'});
            }
            return res.status(200).json({data: user, total: user.length})
        } catch (error) {
            console.error('Kamar getAll error:', error);
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    getById: async (req, res) => {
        try {
            const { id_user } = req.params;
            const user = await UserModel.getById(id_user);
            if(!user){
                return res.status(404).json({message: 'User tidak ditemukan'});
            }
            return res.status(200).json({data: user})
        } catch(error) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
    },

    

    create: async (req, res) => {
        try{
            const result = await UserModel.create(req.body);
            res.status(200).json({message: 'Data user berhasil disimpan'});
        }catch(error){
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    update: async (req, res) => {
        try{
            const {id_user} = req.params;
            const result = await UserModel.update(id_user, req.body);
            return res.status(200).json({message: 'Data user berhasil diubah'});
        }catch(error){
            res.status(500).json({message: 'Internal Server Error'});
        }
    },

    updateMe: async (req, res) => {
        try {
            const { nama } = req.body;
            if (nama !== undefined && !String(nama).trim()) {
                return res.status(400).json({ success: false, message: 'Nama tidak boleh kosong' });
            }

            // id dari token, BUKAN dari req.params / req.body
            await UserModel.updateProfile(req.user.id, req.body);
            return res.status(200).json({ success: true, message: 'Profil berhasil diperbarui' });
        } catch (error) {
            console.error('User updateMe error:', error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    blacklist: async (req, res) => {
        try{
            const {id_user} = req.params;
            const result = await UserModel.blacklist(id_user);
            return res.status(200).json({message: 'User berhasil di blacklist'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    whitelist: async (req, res) => {
        try{
            const {id_user} = req.params;
            const result = await UserModel.whitelist(id_user);
            return res.status(200).json({message: 'User berhasil di whitelist'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    delete: async (req, res) => {
        try{
            const {id_user} = req.params;
            const result = await UserModel.delete(id_user);
            return res.status(200).json({message: 'Data user berhasil di hapus'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },

    deactivate: async (req,res) => {
        try{
            const {id_user} = req.params;
            const result = await UserModel.deactivate(id_user);
            return res.status(200).json({message: 'Data user berhasil di non-aktifkan'});
        }catch(error){
            return res.status(500).json({message: error});
        }
    },
};

module.exports = UserController;