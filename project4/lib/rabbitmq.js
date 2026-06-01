const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

let connection = null;

exports.connectToQueue = async function (callback) {
    connection = await amqp.connect(rabbitmqUrl);
    callback();
};

exports.createChannel = async function (queue) {
    const channel = await connection.createChannel();
    await channel.assertQueue(queue);
    return channel;
};

