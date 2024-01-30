'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Conversation.belongsTo(models.User, {
      //   as: 'receiverable',
      //   foreignKey: 'receiverable_id',
      //   constraints: false
      // });
      Conversation.belongsTo(models.User, {
        as: 'creator',
        foreignKey: 'creator_id'
      });
      Conversation.belongsToMany(models.User, { 
        as: 'members',
        through: models.UserConversation,
        foreignKey: 'conversation_id'
      })
      Conversation.hasMany(models.Message, {
        as: 'messages',
        foreignKey: 'conversation_id',
      });
    }
  }
  Conversation.init({
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    creator_id: {
      type: DataTypes.UUID,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Conversation',
  });
  return Conversation;
};