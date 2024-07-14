// libs
import React from 'react';
// external components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Link } from 'react-router-dom';
// homemade components
import CustomLayout from '../components/MatchaLayout';

const HomePage = () => {
  return (
    <CustomLayout>
      <main className="container mx-auto mt-10 p-5">
        <section className="text-center mb-20">
          <h2 className="text-5xl font-bold text-text-light mb-4">Find Your Perfect Blend</h2>
          <p className="text-xl text-text-light mb-8">Matcha brings together like-minded individuals, creating connections that last.</p>
          <Button size="lg" className="text-lg px-8 py-4 bg-primary text-text-light">
            <Link to="/login">Get Started</Link>
          </Button>
        </section>
        <section className="grid md:grid-cols-3 gap-8">
          <Card className="bg-card-background">
            <CardHeader>
              <CardTitle className="text-card-text">Personalized Matches</CardTitle>
            </CardHeader>
            <CardContent className="text-card-text">
              Our advanced algorithm ensures you meet people who truly complement your personality and interests.
            </CardContent>
          </Card>
          <Card className="bg-card-background">
            <CardHeader>
              <CardTitle className="text-card-text">Safe & Secure</CardTitle>
            </CardHeader>
            <CardContent className="text-card-text">
              Your privacy and safety are our top priorities. Enjoy peace of mind while you connect.
            </CardContent>
          </Card>
          <Card className="bg-card-background">
            <CardHeader>
              <CardTitle className="text-card-text">Success Stories</CardTitle>
            </CardHeader>
            <CardContent className="text-card-text">
              Join thousands of happy couples who found their special someone on Matcha.
            </CardContent>
          </Card>
        </section>
      </main>
    </CustomLayout>
  );
};

export default HomePage;