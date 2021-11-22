module.exports = (sequelize, dataTypes) => {
    let alias = "Imagen";
    let cols = {
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            notNull: true,
            autoIncrement: true
        },
        url: {
            type: dataTypes.STRING(500),
            notNull: true
        },
        Titulo: {
            type: dataTypes.STRING(100),
            notNull: true
        },
        Description: {
            type: dataTypes.STRING,
            notNull: true
        }
    }
    let config = {
        tableName: "imagen",
        timestamps: false
    }

    const Imagen = sequelize.define(alias, cols, config);

    Imagen.associate = function(models) {
        Imagen.belongsTo(models.Usuario, {
            as: "usuario",
            foreignKey: "id_usuario"
        })
    }

    return Imagen;
}