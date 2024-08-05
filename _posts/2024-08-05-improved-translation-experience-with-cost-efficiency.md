---
layout: post
id: 2024-08-05-improved-translation-experience-with-cost-efficiency
title: 'How we improved translation experience with cost efficiency'
date: 2024-08-05 00:00:10
authors: [jie-zhang, yuxin-goh, christian-coffrant, wira-ikbal, tra-tran, pengxuan-xu]
categories: [Engineering, Design]
tags: [Chat, Chat support, Engineering, GrabChat, Messaging, Translation, Generative AI, LLM]
comments: true
cover_photo: /img/improved-translation-experience-with-cost-efficiency/cover.png
excerpt: "Dive into our journey of improving in-app translation experience amidst a post-COVID tourism boom. Discover how we overcame language detection hurdles, crafted an in-house translation model, and implemented stringent quality checks, all while maintaining cost efficiency."
---

## Introduction

As COVID restrictions were fully lifted in 2023, the number of tourists grew dramatically. People began to explore the world again, frequently using the Grab app to make bookings outside of their home country. However, we noticed that communication posed a challenge for some users. Despite our efforts to integrate an auto-translation feature in the booking chat, we received feedback about occasional missed or inaccurate translations. You can refer to this [blog](https://engineering.grab.com/message-center) for a better understanding of Grab’s chat system.

<div class="post-image-section"><figure>
  <img src="/img/improved-translation-experience-with-cost-efficiency/translation-example.png" alt="" style="width:80%"><figcaption align="middle">An example of a bad translation. The correct translation is: 'ok sir'.</figcaption>
  </figure>
</div>

In an effort to enhance the user experience for travellers using the Grab app, we formed an engineering squad to tackle this problem. The objectives are as follows:

- Ensure translation is provided when it’s needed.
- Improve the quality of translation.
- Maintain the cost of this service within a reasonable range.

## Ensure translation is provided when it’s needed

Originally, we relied on users’ device language settings to determine if translation is needed. For example, if both the passenger and driver’s language setting is set to English, translation is not needed. Interestingly, it turned out that the device language setting did not reliably indicate the language in which a user would send their messages. There were numerous cases where despite having their device language set to English, drivers sent messages in another language.

Therefore, we needed to detect the language of user messages on the fly to make sure we trigger translation when it’s needed.

### Language detection

Simple as it may seem, language detection is not that straightforward a task. We were unable to find an open-source language detector library that covered all Southeast Asian languages. We looked for Golang libraries as our service was written in Golang. The closest we could find were the following:

- Whatlang: unable to detect Malay
- Lingua: unable to detect Burmese and Khmer

We decided to choose Lingua over Whatlang as the base detector due to the following factors:

- Overall higher accuracy.
- Capability to provide detection confidence level.
- We have more users using Malay than those using Burmese or Khmer.

When a translation request comes in, our first step is to use Lingua for language detection. If the detection confidence level falls below a predefined threshold, we fall back to call the third-party translation service as it can detect all Southeast Asian languages.

You may ask, why don’t we simply use the third-party service in the first place. It’s because:

- The third-party service only has a translate API that also does language detection, but it does not provide a standalone language detection API.
- Using the translate API is costly, so we need to avoid calling it when it’s unnecessary. We will cover more on this in a later section.

Another challenge we've encountered is the difficulty of distinguishing between Malay and Indonesian languages due to their strong similarities and shared vocabulary. The identical text might convey different meanings in these two languages, which the third-party translation service struggles to accurately detect and translate.

Differentiating Malay and Indonesian is a tough problem in general. However, in our case, the detection has a very specific context, and we can make use of the context to enhance our detection accuracy.

### Making use of translation context

All our translations are for the messages sent in the context of a booking or order, predominantly between passenger and driver. There are two simple facts that can aid in our language detection:

- Booking/order happens in one single country.
- Drivers are almost always local to that country.

So, for a booking that happens in an Indonesian city, if the driver’s message is detected as Malay, it’s highly likely that the message is actually in Bahasa Indonesia.

## Improve quality of translation

Initially, we were entirely dependent on a third-party service for translating our chat messages. While overall powerful, the third-party service is not perfect, and it does generate weird translations from time to time.

<div class="post-image-section"><figure>
  <img src="/img/improved-translation-experience-with-cost-efficiency/weird-translation.png" alt="" style="width:80%"><figcaption align="middle">An example of a weird translation from a third-party service recorded on 19 Dec 2023.</figcaption>
  </figure>
</div>

Then, it came to us that we might be able to build an in-house translation model that could translate chat messages better than the third-party service. The reasons being:

- The scope of our chat content is highly specific. All the chats are related to bookings or orders. There would not be conversations about life or work in the chat. Maybe a small Machine Learning (ML) model would suffice to do the job.
- The third-party service is a general translation service. It doesn’t know the context of our messages. We, however, know the whole context. Having the right context gives us a great edge on generating the right translation.

### Training steps

To create our own translation model, we took the following steps:

- Perform topic modelling on Grab chat conversations.
- Worked with the localisation team to create a benchmark set of translations.
- Measured existing translation solutions against benchmarks.
- Used an open source Large Language Model (LLM) to produce synthetic training data.
- Used synthetic data to train our lightweight translation model.

#### Topic modelling

In this step, our aim was to generate a dataset which is both representative of the chat messages sent by our users and diverse enough to capture all of the nuances of the conversations. To achieve this, we took a stratified sampling approach. This involved a random sample of past chat conversation messages stratified by various topics to ensure a comprehensive and balanced representation.

#### Developing a benchmark

For this step we engaged Grab’s localisation team to create a benchmark for translations. The intention behind this step wasn’t to create enough translation examples to fully train or even finetune a model, but rather, it was to act as a benchmark for translation quality, and also as a set of few-shot learning examples for when we generate our synthetic data.

This second point was critical! Although LLMs can generate good quality translations, LLMs are highly susceptible to their training examples. Thus, by using a set of handcrafted translation examples, we hoped to produce a set of examples that would teach the model the exact style, level of formality, and correct tone for the context in which we plan to deploy the final model.

#### Benchmarking

From a theoretical perspective there are two ways that one can measure the performance of a machine translation system. The first is through the computation of some sort of translation quality score such as a BLEU or CHRF++ score. The second method is via subjective evaluation. For example, you could give each translation a score from 1 to 5 or pit two translations against each other and ask someone to assess which they prefer.

Both methods have their relative strengths and weaknesses. The advantage of a subjective method is that it corresponds better with what we want, a high quality translation experience for our users. The disadvantage of this method is that it is quite laborious. The opposite is true for the computed translation quality scores, that is to say that they correspond less well to a human's subjective experience of our translation quality, but that they are easier and faster to compute.

To overcome the inherent limitations of each method, we decided to do the following:
1. Set a benchmark score for the translation quality of various translation services using a CHRF++ score.
2. Train our model until its CHRF++ score is significantly better than the benchmark score.
3. Perform a manual A/B test between the newly trained model and the existing translation service.

#### Synthetic data generation

To generate the training data needed to create our model, we had to rely on an open source LLM to generate the synthetic translation data. For this task, we spent considerable effort looking for a model which had both a large enough parameter count to ensure high quality outputs, but also a model which had the correct tokenizer to handle the diverse sets of languages which Grab’s customers speak. This is particularly important for languages which use non-standard character sets such as Vietnamese and Thai. We settled on using a public model from [Hugging Face](https://huggingface.co/) for this task.

We then used a subset of the previously mentioned benchmark translations to input as few-shot learning examples to our prompt. After many rounds of iteration, we were able to generate translations which were superior to the benchmark CHRF++ scores which we had attained in the previous section.

#### Model fine tuning
We now had one last step before we had something that was production ready! Although we had successfully engineered a prompt capable of generating high quality translations from the public Hugging Face model, there was no way we’d be able to deploy such a model. The model was far too big for us to deploy it in a cost efficient manner and within an acceptable latency. Our solution to this was to fine-tune a smaller bespoke model using the synthetic training data which was derived from the larger model.

These models were language specific (e.g. English to Indonesian) and built solely for the purpose of language translation. They are 99% smaller than the public model. With approximately 10 Million synthetic training examples, we were able to achieve performance which was 98% as effective as our larger model.

We deployed our model and ran several A/B tests with it. Our model performed pretty well overall, but we noticed a critical problem: sometimes, numbers got mutated in the translation. These numbers can be part of an address, phone number, price etc. Showing the wrong number in a translation can cause great confusion to the users. Unfortunately, an ML model’s output can never be fully controlled; therefore, we added an additional layer of programmatic check to mitigate this issue.

### Post-translation quality check
Our goal is to ensure non-translatable content such as numbers, special symbols, and emojis  in the original message doesn’t get mutated in the translation produced by our in-house model. We extract all the non-translatable content from the original message, count the occurrences of each, and then try to match the same in the translation. If it fails to match, we discard the in-house translation and fall back to using the third-party translation service.

## Keep cost low

At Grab, we try to be as cost efficient as possible in all aspects. In the case of translation, we tried to minimise cost by avoiding unnecessary on-the-fly translations.

As you would have guessed, the first thing we did was to implement caching. A cache layer is placed before both the in-house translation model and the third-party translation. We try to serve translation from the cache first before hitting the underlying translation service. However, given that translation requests are in free text and can be quite dynamic, the impact of caching is limited. There’s more we need to do.

For context, in a booking chat, other than the users, Grab’s internal services can also send messages to the chat room. These messages are called system messages. For example,our food service always sends a message with information on the food order when an order is confirmed.

System messages are all fairly static in nature, however, we saw a very high amount of translation cost attributed to system messages. Taking a deeper look, we noticed the following:

- Many system messages were not sent in the recipient’s language, thus requiring on-the-fly translation.
- Many system messages, though having the same static structure, contain quite a few variants such as passenger’s name and  food order item name. This makes it challenging to utilise our translation cache effectively as each message is different.

Since all system messages are manually prepared, we should be able to get them all manually translated into all the required languages, and avoid on-the-fly translations altogether.

Therefore, we launched an internal campaign, mandating all internal services that send system messages to chat rooms to get manual translations prepared, and pass in the translated contents. This alone helped us save roughly US$255K a year!

## Next steps

At Grab, we firmly believe that our proprietary in-house translation models are not only more cost-effective but cater more accurately to our unique use cases compared to third-party services. We will focus on expanding these models to more languages and countries across our operating regions.

Additionally, we are exploring opportunities to apply learnings of our chat translations to other Grab content. This strategy aims to guarantee a seamless language experience for our rapidly expanding user base, especially travellers. We are enthusiastically looking forward to the opportunities this journey brings!

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
