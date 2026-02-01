import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        }
    ],
    // Opcional: Para saber a qué trabajo se refiere la conversación
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: false,
    },
    lastMessage: {
        type: String,
        default: "",
    },
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    unreadBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;