class ServerSynchronization {
    static endpoint = "ws://localhost:3000/";

}

export function ServerSynced(target, propertyKey: string, descriptor: PropertyDescriptor) {
    const className = target.constructor.name;
    const originalMethod = descriptor.value;
    descriptor.value = function() {
        const originalContext = this;
        const originalArguments = arguments;
        async function exec() {
            originalMethod.apply(originalContext, originalArguments);
        }
        exec();
    }
}