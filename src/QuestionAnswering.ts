import {
  Module,
  torch,
} from 'react-native-pytorch-core';
import WordpieceTokenizer from './tokenizer/WordPieceTokenizer';

// Tokenizer vocabulary
// See https://huggingface.co/distilbert-base-uncased/raw/main/tokenizer.json
import vocab from './tokenizer/vocab.json';

// WordPiece tokenizer that encode text for the model as input and decode the
// model output back to text.
const tokenizer = new WordpieceTokenizer({ vocab: vocab });

/**
 * Answers a question for a given input text. The model needs to be a PyTorch
 * model loaded in the lite interpreter runtime and be compatible with the
 * implemented preprocessing and postprocessing steps.
 *
 * Note: Update the preprocessing and postprocessing steps if the models has
 * different requirements.
 *
 * @param model Model loaded for lite interpreter runtime.
 * @param text The input text.
 * @param question The question to be answered.
 * @returns The answer for the question given the input text.
 */
export default async function answerQuestion(model: Module, text: string, question: string) {
  // Preprocess input (see https://huggingface.co/distilbert-base-uncased#preprocessing)
  const inputText = `[CLS] ${question} [SEP] ${text} [SEP]`;
  const tokenIds = tokenizer.encode(inputText);
  const input = torch.tensor([tokenIds], { dtype: torch.int });
  // Run inference on the PyTorch model
  const output = await model.forward(input);
  // Postprocess output
  // Note: The toGenericDict API is likely going to change
  const dict = output.toGenericDict();
  // Note: The toTensor API is likely going to change
  const startId = dict.start_logits.toTensor().argmax().item();
  // Note: The toTensor API is likely going to change
  const endId = dict.end_logits.toTensor().argmax().item();
  return tokenizer.decode(tokenIds.slice(startId, endId + 1));
}
