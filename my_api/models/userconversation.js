'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserConversation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserConversation.belongsTo(models.User, {
        as: 'user',
        foreignKey: 'user_id'
      });
      UserConversation.belongsTo(models.Conversation, {
        as: 'conversation',
        foreignKey: 'conversation_id'
      });
    }
  }
  UserConversation.init({
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'UserConversation',
  });
  return UserConversation;
};