module.exports = (sequelize, dataTypes) => {
    let alias = "Usuario";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            notNull: true,
            autoIncrement: true
        },
        Nombre: {
            type: dataTypes.STRING(50),
            notNull: true
        },
        Email: {
            type: dataTypes.STRING(100),
            notNull: true
        },
        Password: {
            type: dataTypes.STRING(500),
            notNull: true
        }
    }

    let config = {
        tableName: "usuario",
        timestamps: false
    }

    const Usuario = sequelize.define(alias, cols, config);

    Usuario.associate = function(models) {
        Usuario.hasMany(models.Imagen, {
            as: "imagenes",
            foreignKey: "id_usuario"
        })
    }

    return Usuario;
}