/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  StyleSheet,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import answerQuestion from './QuestionAnswering';
import useModel from './useModel';

const MODEL_URL =
  'https://github.com/pytorch/live/releases/download/v0.1.0/bert_qa.ptl';

function QuestionAnswering() {
  // Insets to respect notches and menus to safely render content
  const insets = useSafeAreaInsets();
  // Load model from a given url.
  const { isReady, model } = useModel(MODEL_URL);
  // Indicates an inference in-flight
  const [isProcessing, setIsProcessing] = useState(false);
  // State varible and setter for input text
  const [text, setText] = useState(
    "The itsy bitsy spider crawled up the water spout. Down came the rain, and washed the spider out. Out came the sun, and dried up all the rain, and the itsy bitsy spider went up the spout again."
  );
  // State variable and setter for question
  const [question, setQuestion] = useState('What crawled up the water spout?');
  // State variable and setter for answer
  const [answer, setAnswer] = useState('');

  async function handleInput(text: string, question: string) {
    // Show feedback to the user if the model hasn't loaded. This shouldn't
    // happen because the isReady variable is only true when the model loaded
    // and isReady. However, this is a safeguard to provide user feedback in
    // unknown edge cases ;)
    if (model == null) {
      Alert.alert('Model not loaded', 'The model has not been loaded yet');
      return;
    }
    // Reset previous answer
    setAnswer("");
    // Show activity indicator
    setIsProcessing(true);
    // Try to answer the question given the input text
    const ans = await answerQuestion(model, text, question);
    // Set the final answer to be rendered on screen
    setAnswer(ans);
    // Hide activity indicator
    setIsProcessing(false);
  }

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color="tomato" />
        <Text style={styles.loadingText}>Loading Distilbert Model</Text>
        <Text>~132 MB</Text>
      </View>
    )
  }

  return (
    <View style={insets}>
      <ScrollView style={styles.container}>
        <Text>Source Text</Text>
        <View style={styles.box}>
          <TextInput
            onChangeText={(text) => setText(text)}
            multiline={true}
            placeholder="Text"
            autoCorrect={false}
            value={text}
          />
        </View>
        <Text>Question</Text>
        <View style={styles.box}>
          <TextInput
            style={{ borderWidth: 0 }}
            onChangeText={(question) => setQuestion(question)}
            placeholder="Ask a question..."
            autoCorrect={false}
            value={question}
          />
        </View>
        <Button
          disabled={isProcessing}
          onPress={() => handleInput(text, question)}
          title="Ask"
        />
        <Text>Answer</Text>
        <View style={styles.box}>
          <Text style={styles.answer}>
            {isProcessing && <ActivityIndicator size="small" color="tomato" />}
            {answer}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QuestionAnswering />
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  answer: {
    fontSize: 16,
  },
  box: {
    borderColor: 'black',
    borderWidth: 1,
    margin: 20,
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    flexDirection: 'column',
    padding: 10,
  },
  loading: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    position: 'absolute',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});
