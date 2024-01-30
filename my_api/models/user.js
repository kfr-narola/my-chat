'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require('bcrypt')

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
    */
    static associate(models) {
      // define association here
      // User.hasMany(models.Conversation, {
      //   as: 'receiverable',
      //   foreignKey: 'receiverable_id',
      //   scope: {
      //     receiverable_type: 'user'
      //   }
      // })
      // User.hasMany(models.Conversation, {
      //   as: 'creator',
      //   foreignKey: 'creator_id',
      // });

      User.belongsToMany(models.Conversation, { 
        as: 'chats',
        through: models.UserConversation,
        foreignKey: 'user_id',
      })
      // User.hasMany(models.Conversation, [
      //   {
      //     foreignKey: 'receiverable_id',
      //     constraints: false,
      //     scope: {
      //       receiverable_type: 'user'
      //     }
      //   }
      // ]);
    }
  }
  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    full_name: {
      type: DataTypes.VIRTUAL,
      get() {
        return `${this.first_name} ${this.last_name}`;
      },
      set(value) {
        throw new Error('Do not try to set the `full_name` value!');
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    online: {
      type: DataTypes.BOOLEAN,
      validate: {
        isBoolean: function (val) {
          return (typeof(val)=='boolean')
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: {
          args: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          msg: "The password must contain at least 8 characters including at least 1 uppercase, 1 lowercase, one number and one special character."
        }
      }
    },
  }, {
    hooks: {
      beforeCreate: async (user, options) => {
        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt)
      }
    },
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    sequelize,
    modelName: 'User',
  });

  User.prototype.validPassword = async (password, hash) => {
    return await bcrypt.compareSync(password, hash);
  }

  return User;
};