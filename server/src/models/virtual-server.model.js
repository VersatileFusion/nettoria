const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const VirtualServer = sequelize.define('VirtualServer', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VMTemplates',
            key: 'id'
        }
    },
    vCenterId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cpu: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    ram: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    storage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    network: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('creating', 'running', 'stopped', 'error'),
        defaultValue: 'creating'
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    lastStarted: {
        type: DataTypes.DATE
    },
    lastStopped: {
        type: DataTypes.DATE
    },
    ipAddress: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.TEXT
    }
}, {
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['status']
        }
    ]
});

const VMTemplate = sequelize.define('VMTemplate', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    vCenterTemplateId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    osType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    osVersion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    defaultCpu: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    defaultRam: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    defaultStorage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    indexes: [
        {
            fields: ['isActive']
        },
        {
            fields: ['osType']
        }
    ]
});

const VMBackup = sequelize.define('VMBackup', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    vmId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'VirtualServers',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    vCenterBackupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    size: {
        type: DataTypes.BIGINT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('creating', 'completed', 'failed'),
        defaultValue: 'creating'
    }
}, {
    indexes: [
        {
            fields: ['vmId']
        },
        {
            fields: ['status']
        }
    ]
});

// Define relationships
VirtualServer.belongsTo(VMTemplate, { foreignKey: 'templateId' });
VMTemplate.hasMany(VirtualServer, { foreignKey: 'templateId' });

VirtualServer.hasMany(VMBackup, { foreignKey: 'vmId' });
VMBackup.belongsTo(VirtualServer, { foreignKey: 'vmId' });

module.exports = {
    VirtualServer,
    VMTemplate,
    VMBackup
}; 