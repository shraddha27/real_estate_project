module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await queryInterface.tableExists('users'))) {
      await queryInterface.createTable('users', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
        username: { type: Sequelize.STRING(100), unique: true, allowNull: false },
        password_hash: { type: Sequelize.TEXT, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      });
    }

    if (!(await queryInterface.tableExists('properties'))) {
      await queryInterface.createTable('properties', {
        id: { type: Sequelize.UUID, primaryKey: true, allowNull: false },
        title: { type: Sequelize.STRING(200), allowNull: false },
        description: { type: Sequelize.TEXT, allowNull: false },
        location: { type: Sequelize.STRING(200), allowNull: false },
        price: { type: Sequelize.DECIMAL(14, 2), allowNull: false },
        type: { type: Sequelize.STRING(30), allowNull: false },
        bedrooms: { type: Sequelize.INTEGER, allowNull: true },
        bathrooms: { type: Sequelize.INTEGER, allowNull: true },
        square_feet: { type: Sequelize.INTEGER, allowNull: false },
        amenities: { type: Sequelize.ARRAY(Sequelize.TEXT), allowNull: false, defaultValue: [] },
        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
        updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      });
    }
  },

  async down(queryInterface) {
    if (await queryInterface.tableExists('properties')) await queryInterface.dropTable('properties');
    if (await queryInterface.tableExists('users')) await queryInterface.dropTable('users');
  },
};
