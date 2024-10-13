'use client'

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ImageIcon, Send } from "lucide-react"
import Image from "next/image"
import { MathJaxContext, MathJax } from "better-react-mathjax";


type Message = {
  id: number
  text: string
  sender: "user" | "other"
  image?: string
}

export default function DesktopChat() {
  const [messages, setMessages] = useState<Message[]>([
  ])
  const [inputText, setInputText] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() || imageFile) {
      // 사용자 메시지 생성
      const newMessage: Message = {
        id: messages.length + 1,
        text: inputText.trim(),
        sender: "user",
        image: imageFile ? URL.createObjectURL(imageFile) : undefined,
      };
      setMessages([...messages, newMessage]);
      setInputText("");
      setImageFile(null);
      setImagePreview(null);
  
      // 응답 자리 확보
      const otherMessage: Message = {
        id: messages.length + 2,
        text: "",
        sender: "other",
      };
      setMessages((prevMessages) => [...prevMessages, otherMessage]);
  
      try {
        // FormData 생성
        const formData = new FormData();
        formData.append("question", newMessage.text);
        formData.append("thread_id", threadId || "");
        if (imageFile) {
          formData.append("image", imageFile);
        }
  
        const response = await fetch("https://43.201.6.239.nip.io/ask", {
          method: "POST",
          body: formData,
        });
  
        if (!response.ok || !response.body) {
          throw new Error("Network response was not ok");
        }
  
        const newThreadId = response.headers.get("X-Thread-ID");
        if (newThreadId && !threadId) {
          setThreadId(newThreadId);
        }
  
        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";
  
        while (true) {
          const { value, done } = await reader?.read() || {};
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
  
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            updatedMessages[updatedMessages.length - 1].text = result;
            return updatedMessages;
          });
        }
      } catch (error) {
        console.error("Error fetching response:", error);
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="h-screen">
      <div className="w-full px-4 h-full mx-auto flex flex-col pb-10">
      <div className="flex justify-center pt-5 mb-5">
        <h1 className="text-lg font-bold mb-6">듣는 선생님 홍PT</h1>
      </div>
        <MathJaxContext>
          {messages.length > 0 ? (
        <ScrollArea className="flex-grow pr-4">
            <div className="space-y-4 py-10">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 ${
                      message.sender === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"
                    }`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {message.sender === "user" ? "U" : "O"}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-2 max-w-xs ${
                        message.sender === "user"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      {message.text && message.text.split(/(?<!\\)\n(?![^\[]*\])/).map((line, index) => (
                      <MathJax key={index} dynamic>
                        <p className="mb-2">{line}</p>
                      </MathJax>
                      ))}
                      {message.image && (
                        <Image
                          src={message.image}
                          alt="Uploaded content"
                          className="mt-2 rounded-md max-w-full h-auto"
                          width={500} // 원하는 너비로 설정
                          height={500} // 원하는 높이로 설정
                          unoptimized
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center min-h-screenp-4">
              <h1 className="text-lg font-bold mb-2 text-center">수학을 잘하려면</h1>
              <h1 className="text-lg font-bold mb-2 text-center">수학적 개념을 직접 설명하는 과정이 매우 중요합니다! 💯</h1>
              <h1 className="text-lg font-bold mb-2 text-center">자신이 푼 수학문제를 홍PT에게 설명해보세요!! 💁🏻‍♂️</h1>
              <h1 className="text-lg font-bold mb-2 text-center">설명에 부족한 부분이 있으면</h1>
              <h1 className="text-lg font-bold mb-2 text-center">홍PT가 여러분에게 힌트를 제공하고</h1>
              <h1 className="text-lg font-bold mb-2 text-center">질문을 던지며</h1>
              <h1 className="text-lg font-bold mb-2 text-center">완벽한 설명을 완성할 수 있도록 도와드립니다.</h1>
              <h1 className="text-lg font-bold mb-2 text-center">24시간 여러분 곁을 지키는 과외선생님 홍PT에요!!! 👨🏻‍🏫</h1>
            </div>
          )}
        <form onSubmit={handleSendMessage} className="w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="궁금하신 내용을 입력해주세요"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full p-3 pr-20 rounded-full border bg-gray-100 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            {imagePreview && (
              <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                <Image
                  src={imagePreview}
                  alt="Image preview"
                  className="rounded-full"
                  width={30} // 작은 크기로 설정
                  height={30} // 작은 크기로 설정
                  unoptimized
                />
              </div>
            )}
            <button
              type="button"
              className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <ImageIcon className="h-6 w-6" />
            </button>
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
          </form>
          </MathJaxContext>
      </div>
    </div>
  )
}
