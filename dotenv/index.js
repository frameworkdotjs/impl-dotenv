const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg

// Parse src into an Object
function parse(src) {
    const obj = {}

    // Convert buffer to string
    let lines = src.toString()

    // Convert line breaks to same format
    lines = lines.replace(/\r\n?/mg, '\n')

    let match
    while ((match = LINE.exec(lines)) != null) {
        const key = match[1]

        // Default undefined or null to empty string
        let value = (match[2] || '')

        // Remove whitespace
        value = value.trim()

        // Check if double quoted
        const maybeQuote = value[0]

        // Remove surrounding quotes
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2')

        // Expand newlines if double quoted
        if (maybeQuote === '"') {
            value = value.replace(/\\n/g, '\n')
            value = value.replace(/\\r/g, '\r')
        }

        // Add to object
        obj[key] = value
    }

    return obj
}

// Populate process.env with parsed values
function populate(processEnv, parsed, options = {}) {
    const debug = Boolean(options && options.debug)
    const override = Boolean(options && options.override)

    if (typeof parsed !== 'object') {
        throw new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate')
    }

    // Set process.env
    for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
            if (override === true) {
                processEnv[key] = parsed[key]
            }

            if (debug) {
                if (override === true) {
                    _debug(`"${key}" is already defined and WAS overwritten`)
                } else {
                    _debug(`"${key}" is already defined and was NOT overwritten`)
                }
            }
        } else {
            processEnv[key] = parsed[key]
        }
    }
}

function _debug(message) {
    console.log(`[dotenv@${version}][DEBUG] ${message}`)
}

module.exports.parse = parse
module.exports.populate = populate
