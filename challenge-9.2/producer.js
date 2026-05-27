const amqp = require('amqplib');
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqUrl = `amqp://${rabbitmqHost}`;

const readline = require('readline');
const { promisify } = require('util');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = promisify(rl.question).bind(rl);

async function main() {
    try {
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('echo');

        while (true) {
            const answer = await question("Enter something (or \"q\" to quit): ");
            if (!answer || answer == 'q')
                break;
            console.log(`You typed "${answer}"`);
            channel.sendToQueue('echo', Buffer.from(answer));
        }
        rl.close();

        await channel.close();
        await connection.close();

    } catch (err) {
        console.error(err);
    }


}

main();
