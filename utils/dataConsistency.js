import User from '../model/user.js';
import Post from '../model/post.js';

const checkAndUpdateData = async () => {
    try {
      const posts = await Post.find().select('_id creator');
    
      for (const post of posts) {
        const user = await User.findById(post.creator);
    
        if (user) {
          const thoughtIndex = user.thoughts.findIndex(thoughtId => thoughtId.equals(post._id));
    
          if (thoughtIndex === -1) {
            user.thoughts.push(post._id);
            await user.save();
          }
        }
      }
    
      console.log('Data consistency check completed');
    } catch (error) {
      console.error('Error in data consistency check:', error);
    }
  };

export default checkAndUpdateData;
