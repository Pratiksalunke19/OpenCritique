import { Github, Users, MessageSquareHeart } from "lucide-react";

const Community = () => {
  return (
    <section className="py-20 px-6 bg-panel text-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-12">
          Join the Community
        </h2>

        <div className="mt-16 mb-16 grid gap-6 md:grid-cols-2">
          <div className="bg-[#1A2B4C] p-6 rounded-2xl shadow-lg text-left">
            <h3 className="text-xl font-semibold mb-2">
              What Makes a Great Critique?
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Be specific, not vague</li>
              <li>Point out what's working</li>
              <li>Suggest, don't dictate</li>
              <li>Be kind but honest</li>
            </ul>
          </div>

          <div className="bg-[#1A2B4C] p-6 rounded-2xl shadow-lg text-left">
            <h3 className="text-xl font-semibold mb-2">
              How to Give Better Feedback
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li>Focus on technique, not taste</li>
              <li>Use art terms where possible</li>
              <li>Encourage experimentation</li>
              <li>Respect the artist's intent</li>
            </ul>
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <a
            href="https://discord.gg/wBxmyWWC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 transition px-6 py-3 rounded-xl font-medium"
          >
            <Users size={20} /> Join our Discord
          </a>

          <a
            href="https://github.com/Pratiksalunke19/OpenCritique"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-white px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition "
          >
            <Github size={20} /> Contribute on GitHub
          </a>

          <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition px-6 py-3 rounded-xl font-medium">
            <MessageSquareHeart size={20} /> Join the DAO
          </button>
        </div>
      </div>
    </section>
  );
};

export default Community;
