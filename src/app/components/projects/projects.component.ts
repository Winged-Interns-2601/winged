import { NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-projects',
  imports: [NgFor, NgIf, FormsModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit {

  @Input() projects!: any[];
  @Input() role!: string;
  selectedProjectId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    // Get project ID from route params if available
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectedProjectId = params['id'];
      }
    });
  }

  projects1 = [
    { title: 'Resume Analyzer', tech: 'HTML • CSS • JS', image: 'assets/img10.jpg' },
    { title: 'Daily Expense Tracker', tech: 'Angular • TypeScript', image: 'assets/img9.jpg' },
    { title: 'Portfolio Website', tech: 'Angular • Tailwind', image: 'assets/img12.jpg' }
  ];

  editingIndex: number | null = null;
  editProject = { title: '', tech: '', image: '' };

  addProject(title: string, tech: string, image: string) {
    this.projects1.push({ title, tech, image });
  }

  deleteProject(index: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projects1.splice(index, 1);
    }
  }

  startEdit(index: number) {
    this.editingIndex = index;
    this.editProject = { ...this.projects1[index] };
  }

  cancelEdit() {
    this.editingIndex = null;
    this.editProject = { title: '', tech: '', image: '' };
  }

  saveEdit() {
    if (this.editingIndex !== null) {
      this.projects1[this.editingIndex] = { ...this.editProject };
      this.editingIndex = null;
      this.editProject = { title: '', tech: '', image: '' };
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.editProject.image = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }
}