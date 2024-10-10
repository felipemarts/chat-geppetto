
import { commandProcess } from '../services/command';

// Controller to process a command
export const postCommandController = async (req: any, res: any) => {
  const { id, command, content } = req.body;
  
  try {
    // Process the command using the service
    await commandProcess({ id, command, content });
    
    // Send success response
    res.status(200).json({ message: 'File processed successfully' });
  } catch (error) {
    // Send error response
    res.status(500).json({ message: 'Error processing the file', error: error.toString() });
  }
};
